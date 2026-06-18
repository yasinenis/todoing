package app.todooing.mobile;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Çalışan sayaç için kalıcı (ongoing) bildirim. Android'in kendi kronometresi
 * süreyi saniye saniye ilerletir/geri sayar; bildirim kilit ekranında da görünür.
 */
@CapacitorPlugin(name = "TimerNotification")
public class TimerNotificationPlugin extends Plugin {

    private static final String CHANNEL_ID = "timer";
    private static final int NOTIF_ID = 4271;

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "Sayaç", NotificationManager.IMPORTANCE_LOW);
            ch.setShowBadge(false);
            NotificationManager nm =
                    (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }

    private NotificationCompat.Builder base(String title) {
        Context ctx = getContext();
        Intent launch = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        PendingIntent pi = PendingIntent.getActivity(
                ctx, 0, launch,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
        return new NotificationCompat.Builder(ctx, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_stat_timer)
                .setContentTitle(title)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pi);
    }

    @PluginMethod
    public void start(PluginCall call) {
        ensureChannel();
        String title = call.getString("title", "Sayaç");
        Boolean cd = call.getBoolean("countDown", false);
        boolean countDown = cd != null && cd;
        Double baseD = call.getDouble("base");
        long when = baseD != null ? baseD.longValue() : System.currentTimeMillis();

        NotificationCompat.Builder b = base(title)
                .setUsesChronometer(true)
                .setWhen(when);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            b.setChronometerCountDown(countDown);
        }
        NotificationManagerCompat.from(getContext()).notify(NOTIF_ID, b.build());
        call.resolve();
    }

    @PluginMethod
    public void pause(PluginCall call) {
        ensureChannel();
        String title = call.getString("title", "Sayaç");
        String text = call.getString("text", "Duraklatıldı");
        NotificationCompat.Builder b = base(title)
                .setUsesChronometer(false)
                .setContentText(text);
        NotificationManagerCompat.from(getContext()).notify(NOTIF_ID, b.build());
        call.resolve();
    }

    @PluginMethod
    public void stop(PluginCall call) {
        NotificationManagerCompat.from(getContext()).cancel(NOTIF_ID);
        call.resolve();
    }
}
