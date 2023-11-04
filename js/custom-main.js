// Digital Watch Time

var Format = 1,
  TimeHolder = 0,
  StopChecker = 0;

function resetTimer() {
  $(".S1").removeClass().addClass("NumberHolder S1 show0");
  $(".S2").removeClass().addClass("NumberHolder S2 show0");

  $(".M1").removeClass().addClass("NumberHolder M1 show0");
  $(".M2").removeClass().addClass("NumberHolder M2 show0");

  $(".H1").removeClass().addClass("NumberHolder H1 show0");
  $(".H2").removeClass().addClass("NumberHolder H2 show0");
}

function SetDay(DD) {
  $(".WeekDays span:nth-child(" + ((DD + 2) % 7) + ")").addClass("active");
}

function Run24hr(S1, S2, M1, M2, H1, H2) {
  $(".S1")
    .removeClass()
    .addClass("NumberHolder S1 show" + S1);
  $(".S2")
    .removeClass()
    .addClass("NumberHolder S2 show" + S2);

  $(".M1")
    .removeClass()
    .addClass("NumberHolder M1 show" + M1);
  $(".M2")
    .removeClass()
    .addClass("NumberHolder M2 show" + M2);

  $(".H1")
    .removeClass()
    .addClass("NumberHolder H1 show" + H1);
  $(".H2")
    .removeClass()
    .addClass("NumberHolder H2 show" + H2);
}

function Run12hr(S1, S2, M1, M2, HH) {
  if (HH > 12) {
    HH = HH - 12;
    $(".Formats span:nth-child(2)").addClass("active");
  } else {
    $(".Formats span:nth-child(1)").addClass("active");
  }
  var H1 = Math.floor(HH / 10),
    H2 = HH % 10;

  $(".S1")
    .removeClass()
    .addClass("NumberHolder S1 show" + S1);
  $(".S2")
    .removeClass()
    .addClass("NumberHolder S2 show" + S2);

  $(".M1")
    .removeClass()
    .addClass("NumberHolder M1 show" + M1);
  $(".M2")
    .removeClass()
    .addClass("NumberHolder M2 show" + M2);

  if (H1 === 0) {
    $(".H1").fadeOut(0);
  } else {
    $(".H1")
      .fadeIn()
      .removeClass()
      .addClass("NumberHolder H1 show" + H1);
  }
  $(".H2")
    .removeClass()
    .addClass("NumberHolder H2 show" + H2);
}

function Stopwatch(TimeHolder) {
  var HH = Math.floor(TimeHolder / 3600),
    MM = Math.floor((TimeHolder - HH * 3600) / 60),
    SS = Math.floor(TimeHolder - HH * 3600 - MM * 60);

  var S1 = Math.floor(SS / 10),
    S2 = SS % 10,
    M1 = Math.floor(MM / 10),
    M2 = MM % 10,
    H1 = Math.floor(HH / 10),
    H2 = HH % 10;

  Run24hr(S1, S2, M1, M2, H1, H2);
}

function update_time() {
  var dt = new Date(),
    HH = dt.getHours(),
    MM = dt.getMinutes(),
    SS = dt.getSeconds(),
    DD = dt.getDay();
  SetDay(DD);

  var S1 = Math.floor(SS / 10),
    S2 = SS % 10,
    M1 = Math.floor(MM / 10),
    M2 = MM % 10,
    H1 = Math.floor(HH / 10),
    H2 = HH % 10;

  if (Format === 1) {
    Run12hr(S1, S2, M1, M2, HH);
  } else if (Format === 2) {
    Run24hr(S1, S2, M1, M2, H1, H2);
  } else if (Format === 3 && StopChecker === 0) {
    TimeHolder++;
    Stopwatch(TimeHolder);
  } else if (Format === 4 && StopChecker === 0) {
    TimeHolder--;
    if (TimeHolder === 0) {
      AlarmOut();
    } else {
      Stopwatch(TimeHolder);
    }
  }

  setTimeout(update_time, 1000);
}

$(".Type span").on("click", function () {
  $(".Type .active").removeClass("active");
  $(this).addClass("active");
  var T = $(this).html();
  if (T === "24hr") {
    Format = 1;
    $(".H1").fadeIn();
    $(".Formats span").removeClass("active");
  } else {
    Format = 2;
  }
});

$(".fa-stopwatch").on("click", function () {
  $("body").removeClass("BgAnimation");
  $(".H1").fadeIn();
  if (!$(".TimeHolder").hasClass("StopWatch")) {
    Format = 3;
    resetTimer();
    StopChecker = 1;
    $(".TimeHolder").removeClass().addClass("TimeHolder StopWatch");
    $(".Numbers").fadeIn(0);
    $(".Pause").removeClass("active");
    $(".Start").addClass("active");
    TimeHolder = 0;
  }
});

$(".Start").on("click", function () {
  $("body").removeClass("BgAnimation");
  if (Format === 3) {
    StopChecker = 0;
    $(this).removeClass("active");
    $(".Pause").addClass("active");
  } else if (Format === 4) {
    TimeHolder = $(".AlarmInput input").val();
    if (TimeHolder > 0) {
      StopChecker = 0;
      resetTimer();
      $(this).removeClass("active");
      $(".Pause").addClass("active");
      $(".AlarmInput").addClass("DisNone");
      $(".Numbers").fadeIn(0);
    }
  }
});

$(".Pause").on("click", function () {
  StopChecker = 1;
  $(this).removeClass("active");
  $(".Start").addClass("active");
});

$(".Stop").on("click", function () {
  $("body").removeClass("BgAnimation");
  if (Format === 3) {
    StopChecker = 1;
    TimeHolder = 0;
    resetTimer();
    $(".Pause").removeClass("active");
    $(".Start").addClass("active");
  } else if (Format === 4) {
    resetTimer();
    StopChecker = 1;
    $(".AlarmInput").removeClass("DisNone");
    $(".Numbers").fadeOut(0);
    $(".AlarmInput input").val("");
    $(".Pause").removeClass("active");
    $(".Start").addClass("active");
  }
});

$(".fas.fa-clock").on("click", function () {
  $("body").removeClass("BgAnimation");

  if ($(".Type .active").html() === "12hr") {
    Format = 2;
  } else {
    Format = 1;
  }

  StopChecker = 0;
  $(".TimeHolder").removeClass().addClass("TimeHolder");
  $(".Numbers").fadeIn(0);
});

$(".far.fa-clock").on("click", function () {
  $("body").removeClass("BgAnimation");
  $(".H1").fadeIn();
  if (!$(".TimeHolder").hasClass("Alarm")) {
    $(".TimeHolder").removeClass().addClass("TimeHolder Alarm");
    Format = 4;
    resetTimer();
    StopChecker = 1;
    $(".AlarmInput").removeClass("DisNone");
    $(".TimeHolder").addClass("Alarm");
    $(".Numbers").fadeOut(0);
    $(".Pause").removeClass("active");
    $(".Start").addClass("active");
  }
});

// Alarm Out
function AlarmOut() {
  $("body").addClass("BgAnimation");
  resetTimer();
  StopChecker = 1;
}

update_time();

//digital time end

//Count Time STart
function drawTime(ctx, radius) {
  var now = new Date();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();
  //hour
  hour = hour % 12;
  hour =
    (hour * Math.PI) / 6 +
    (minute * Math.PI) / (6 * 60) +
    (second * Math.PI) / (360 * 60);
  drawHand(ctx, hour, radius * 0.5, radius * 0.07);
  //minute
  minute = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
  drawHand(ctx, minute, radius * 0.8, radius * 0.07);
  // second
  second = (second * Math.PI) / 30;
  drawHand(ctx, second, radius * 0.9, radius * 0.02);
}

function drawHand(ctx, pos, length, width) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.moveTo(0, 0);
  ctx.rotate(pos);
  ctx.lineTo(0, -length);
  ctx.stroke();
  ctx.rotate(-pos);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function timerFun(minute) {
  for (minute = minute - 1; minute >= 0; minute--) {
    for (let second = 59; second >= 0; second--) {
      m = minute.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
      s = second.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
      });
      document.getElementById("countdown").innerHTML = m + ":" + s;
      await sleep(1000);
    }
    //        document.getElementsByTagName('body')[0].style.backgroundImage = "url('images/coffe" + ((minute % 4) + 1) + ".jpg')";
  }
}

// timerFun(parseInt(prompt("Type Your Break Time : ")));
//document.getElementById('countdown').innerHTML = minute+':'+second;

//Count Time End

//Footer Credits Work
// $(document).ready(function () {
//   if ($("#footer-post").length == 1) {
//     // check if <a> exists in id="footer-post" and changes <a> address and class
//     $("#footer-post a")
//       .prop("href", "http://wapborhan.com/")
//       .prop("class", "footer-3")
//       .text("Borhan Uddin");
//   }

//   if ($("#footer-post").length >= 1 && $("a.footer-3").length == 0) {
//     // if link is erased it creates a new one in the same div
//     $("<a>", {
//       class: "footer-3",
//       text: "Borhan Uddin",
//       href: "http://wapborhan.com/",
//     }).appendTo("#footer-post");
//   }

//   if ($("#footer-post").length == 0 && $("a.footer-3").length == 0) {
//     // if div and link are erased it shows an alert and load yahoo
//     alert("Link has been erased");
//     window.location.href = "http://wapborhan.com/";
//   }
// });
