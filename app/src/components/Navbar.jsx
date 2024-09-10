import React, { useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence, useCycle } from "framer-motion";
import { navbarItems, navbarTitle } from "constants";
import { Animation, TextAnimation } from "views";
import { MenuToggle } from "components";
import Logo from "components/Logo.png";

const useDimensions = (ref) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    dimensions.current.width = ref.current.offsetWidth;
    dimensions.current.height = ref.current.offsetHeight;
  }, []);

  return dimensions.current;
};

const lists = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const ListConatiner = ({
  isMenuToggle,
  styles,
  handleOnClick,
  index,
  children,
}) =>
  isMenuToggle ? (
    <motion.li
      key={index}
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        transition: {
          delay: (index + 1) * 0.05,
        },
      }}
      exit={{
        opacity: 0,
        transition: {
          delay: (14 - index) * 0.05,
        },
      }}
      className={styles}
      onClick={() => handleOnClick && handleOnClick()}
    >
      {children}
    </motion.li>
  ) : (
    <li key={index} className={styles}>
      {children}
    </li>
  );

const MenuItem = ({ isMenuToggle, isOpen, handleOnClick }) => {
  const NavLinkStyle =
    "text-[#1c1c1c] sm:text-[14px] text-[16px] font-[400] w-full hover:bg-[#1c1c1c0d] sm:p-[8px] p-[12px] sm:text-left text-center rounded-[8px]";
  return (
    <>
      <ListConatiner
        isMenuToggle={isMenuToggle}
        index={0}
        isOpen={isOpen}
        styles="flex flex-row items-center sm:mx-[10px] sm:justify-start justify-center sm:gap-x-0 gap-x-4"
      >
        <div className="sm:mr-0 flex items-center font-[600] h-[110px] uppercase sm:text-left text-center text-[#1c1c1c] font-[600]">
          Recurrent neural network
        </div>
        <img
          src={Logo}
          alt="Recurrent neural network"
          className="w-[70px] h-[110px]"
        />
      </ListConatiner>
      {navbarItems.map(({ title, link }, indexTitle) => (
        <>
          <ListConatiner
            index={indexTitle === 0 ? 1 : 7}
            isOpen={isOpen}
            isMenuToggle={isMenuToggle}
            styles="flex flex-col justify-center sm:gap-x-0 gap-x-4
            items-center flex-wrap sm:border-none border-[2px]
            border-[#1c1c1c0d] rounded-[8px] sm:p-[0px] p-[8px] text-left"
          >
            <div className="text-[#1c1c1c66] font-[400] text-center">
              {title}
            </div>
            <div className="sm:w-full hidden sm:block">
              {title == "Time series" ? <Animation /> : <TextAnimation />}
            </div>
          </ListConatiner>
          {navbarTitle.map(
            (props, index) =>
              (props !== "preparation" ||
                (props == "preparation" && title === "Text")) && (
                <ListConatiner
                  index={indexTitle === 0 ? index + 1 : index + 8}
                  isOpen={isOpen}
                  isMenuToggle={isMenuToggle}
                  handleOnClick={handleOnClick}
                  styles="flex w-full gap-4"
                >
                  <NavLink
                    key={index}
                    to={`${props}/${link}`}
                    className={({ isActive }) =>
                      isActive
                        ? `bg-[#1c1c1c0d] ${NavLinkStyle}`
                        : `${NavLinkStyle}`
                    }
                  >
                    {props[0].toUpperCase()}
                    {props.slice(1)}
                  </NavLink>
                </ListConatiner>
              )
          )}
        </>
      ))}
    </>
  );
};

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 26px 24px)`,
    transition: {
      //delay: 10,
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(20px at 26px 24px)",
    transition: {
      delay: 0.5,
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const Navbar = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);

  return (
    <motion.nav
      initial={false}
      animate={isOpen ? "open" : "closed"}
      custom={height}
      ref={containerRef}
    >
      <motion.div
        className="sm:hidden absolute inset-0 bg-[white] z-10"
        variants={sidebar}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              transition: {
                delay: 0.5,
              },
            }}
            className={`min-h-[100vh] overflow-scroll z-10 sm:hidden flex justify-center absolute w-[100%] flex-col p-[12px] border-r-[1px] border-r-[#1c1c1c1a] border-r-solid gap-y-[1px] gap-x-[4px] bg-[white]`}
          >
            <motion.div variants={variants} className="flex flex-col gap-1">
              <MenuItem
                isMenuToggle={true}
                isOpen={isOpen}
                handleOnClick={() => toggleOpen()}
              />
            </motion.div>
          </motion.ul>
        )}
      </AnimatePresence>
      <MenuToggle toggle={() => toggleOpen()} />
      <div className="sm:flex hidden h-[100vh] fixed">
        <ul
          className={`overflow-auto sm:flex hidden w-[220px] flex flex-col p-[12px] border-r-[1px] border-r-[#1c1c1c1a] border-r-solid gap-[4px]`}
        >
          <MenuItem isMenuToggle={false} />
        </ul>
      </div>
    </motion.nav>
  );
};

export default Navbar;
