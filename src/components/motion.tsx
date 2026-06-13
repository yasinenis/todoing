import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Kademeli (stagger) giriş için kapsayıcı. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Aşağıdan yukarı yumuşak beliren öğe (Stagger içinde kullanılır). */
export function FadeUp({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
      }}
    >
      {children}
    </motion.div>
  );
}
