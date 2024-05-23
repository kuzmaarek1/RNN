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
          .typeString(
            "Best pizza ever! <strong style='color: green;font-size: 12px;'>Positive</strong>"
          )
          .pauseFor(2500)
          .deleteChars(26)
          .typeString(
            "Food was bad. <strong style='color: red;font-size: 12px;'>Negative</strong>"
          )
          .pauseFor(2500)
          .deleteChars(23)
          .typeString(
            "Delicious cake! <strong style='color: green;font-size: 12px;'>Positive</strong>"
          )
          .pauseFor(2500)
          .deleteChars(25)
          .typeString(
            "Terrible service. <strong style='color: red; font-size: 12px;'>Negative</strong>"
          )
          .deleteChars(26)
          .start();
      }}
    />
  );
};

export default SlidingText;
