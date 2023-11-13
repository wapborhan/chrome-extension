var els = document.getElementsByClassName("styled-button");

for (var i = 0; i < els.length; i++) {
  // console.log(els[i].id);
  els[i].addEventListener("click", function (event) {
    changeBackground(this.id);
  });
}

function changeBackground(id) {
  // document.querySelectorAll('[id^="background"]');
  // var classes = console.log(document.querySelector("body").classList.length);
  // clear all background classes from body
  const cls = [
    "background-image-books",
    "background-image-strawberries",
    "background-image-sea",
  ];
  document.querySelector("body").classList.remove(...cls);

  switch (id) {
    case "books":
      document.querySelector("body").classList.add("background-image-books");
      break;
    case "strawberries":
      document
        .querySelector("body")
        .classList.add("background-image-strawberries");
      break;
    case "sea":
      document.querySelector("body").classList.add("background-image-sea");
      break;
    default:
      console.log("switch caught nothing");
      break;
  }
}
