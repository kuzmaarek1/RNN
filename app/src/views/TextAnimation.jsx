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
          .pauseFor(300)
          .typeString("Go until jurong point")
          .pauseFor(2500)
          .deleteChars(22)
          .typeString("This is a <strong>ham</strong>")
          .pauseFor(2500)
          .deleteChars(13)
          .typeString("Free entry")
          .pauseFor(2500)
          .deleteChars(10)
          .typeString("This is a <strong>spam</strong>")
          .deleteChars(14)
          .start();
      }}
    />
  );
};

export default SlidingText;
