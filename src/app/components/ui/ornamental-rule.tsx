import { motion } from 'framer-motion';

export default function OrnamentalRule() {
  return (
    <motion.div
      className="mx-auto flex w-full max-w-lg items-center gap-3"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-900 to-red-700" />
      <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
      <div className="h-2.5 w-2.5 rotate-45 border border-red-600" />
      <div className="h-1.5 w-1.5 rotate-45 bg-red-700" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-900 to-red-700" />
    </motion.div>
  );
}
