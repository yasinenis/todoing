package app.todooing.mobile;

import android.os.Build;
import android.os.Bundle;

import androidx.core.app.ActivityCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Özel eklentiyi köprüye kaydet (super.onCreate'ten ÖNCE).
        registerPlugin(TimerNotificationPlugin.class);
        super.onCreate(savedInstanceState);

        // Android 13+ : bildirim izni iste (sayaç bildirimi için).
        if (Build.VERSION.SDK_INT >= 33) {
            ActivityCompat.requestPermissions(
                    this,
                    new String[]{"android.permission.POST_NOTIFICATIONS"},
                    1001);
        }
    }
}
