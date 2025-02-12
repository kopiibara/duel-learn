import { motion } from "framer-motion";
import { ReactNode } from "react";

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.5, ease: "easeIn" } },
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
