const roasts = [
  "Is your drama going to an intermission soon?",
  "It’s a shame you can’t Photoshop your personality.",
  "Jealousy is a disease. Get well soon, bitch! ",
  "If I had a face like yours I’d sue my parents.",
  "I forgot the world revolves around you. My apologies! How silly of me.",
  "Hold still. I’m trying to imagine you with a personality.",
  "Don’t be ashamed of who you are. That’s your parents’ job.",
  "If you’re going to be two-faced, at least make one of them pretty.",
  "Oops, my bad. I could’ve sworn I was dealing with an adult.",
  "I would smack you, but I’m against animal abuse.",
];

var roast = document.getElementById("roasts");
roast.innerHTML = roasts[Math.floor(Math.random() * roasts.length)];

function updateTime() {
  var today = new Date();

  const greet1 = "Good morning,Borhan Uddin.";
  const greet2 = "Good afternoon, Borhan Uddin.";
  const greet3 = "Good evening, Borhan Uddin.";
  const greet4 = "Good Night, Borhan Uddin.";

  var greeting = document.getElementById("greetingHeading");

  if (today.getHours() > 4 && today.getHours() < 12) {
    greeting.innerHTML = greet1;
  }
  if (today.getHours() >= 12 && today.getHours() < 16) {
    greeting.innerHTML = greet2;
  }
  if (today.getHours() >= 16 && today.getHours() <= 24) {
    greeting.innerHTML = greet3;
  }
  if (today.getHours() >= 17 && today.getHours() <= 24) {
    greeting.innerHTML = greet4;
  }
}
setInterval(updateTime, 10);
