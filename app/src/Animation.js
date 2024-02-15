import React from "react";
import { motion } from "framer-motion";

export default function Blob() {
    return (
        <div
            className="w-[80%] h-[100%] stroke-slate-50 border border-sky-500 p-4"
            style={{
                border: "none",
                padding: "0",
                marginLeft: "auto",
                marginRight: "auto"
            }}
        >
            <motion.svg width="800" height="161" viewBox="0 0 800 161" className="w-[100%] h-[100%]">
                <motion.path initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }}
                    stroke="#8884d8" stroke-width="1" fill="none" width="790" height="151"
                    d="M5,119.76C48.889,127.325,92.778,134.89,136.667,134.89C180.556,134.89,224.444,8.02,268.333,8.02C312.222,8.02,356.111,96.989,400,96.989C443.889,96.989,487.778,83.52,531.667,83.52C575.556,83.52,619.444,98.62,663.333,98.62C707.222,98.62,751.111,94.845,795,91.07" />
                <motion.circle
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="5" cy="119.76" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="136.66666666666666" cy="134.8902" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="268.3333333333333" cy="8.020000000000003" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="400" cy="96.98919999999998" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="531.6666666666666" cy="83.52000000000001" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="663.3333333333333" cy="98.62" class="recharts-dot recharts-line-dot" />
                <motion.circle initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 2,
                        delay: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                        repeatDelay: 3
                    }} r="3" stroke="#8884d8" stroke-width="2" fill="#fff" width="790" height="151" cx="795" cy="91.07000000000002" class="recharts-dot recharts-line-dot" />
            </motion.svg>
        </div>
    );
}
/*
  
            <motion.svg width="100px" height="50px" className="m-auto block bg-[yellow]" xmlns="http://www.w3.org/2000/svg">
                <motion.circle
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                        duration: 2,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop",
                        repeatDelay: 1
                    }}
                    cx="25" cy="25" r="20" className="stroke-[black] stroke-[5px]  fill-[green]" />
            </motion.svg>
*/