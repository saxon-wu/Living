import { motion } from "framer-motion";
import cn from "classnames";

const containerVariants = {
  initial: { scale: 0.96, y: 30, opacity: 0 },
  enter: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: [0.48, 0.15, 0.25, 0.96] },
  },
};

type Props = {
  full?: boolean;
  className?: string;
};

const Container: React.FunctionComponent<Props> = ({
  children,
  full = false,
  className
}) => {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={{ exit: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.div
        variants={containerVariants}
        className={cn(`${className}`, {
          "container mx-auto px-5": !full,
        })}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
export default Container;
