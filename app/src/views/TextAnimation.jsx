import Typewriter from "typewriter-effect";

const SlidingText = () => {
  return (
    <Typewriter
      options={{
        autoStart: true,
        loop: true,
        delay: 75,
      }}
      onInit={(typewriter) => {
        typewriter
          .pauseFor(2500)
          .typeString("A simple yet powerful native javascript")
          .pauseFor(300)
          .deleteChars(10)
          .typeString(
            "<strong>JS</strong> plugin for a cool typewriter effect and "
          )
          .typeString(
            '<strong>only <span style="color: #27ae60;">5kb</span> Gzipped!</strong>'
          )
          .pauseFor(1000)
          .start();
      }}
    />
  );
};

export default SlidingText;
