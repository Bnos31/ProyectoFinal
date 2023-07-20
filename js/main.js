const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
let predictedAges = [];

const faceTypes = {
  0: "Indefinido",
  1: "Redondo",
  2: "Ovalado",
  3: "Cuadrado",
  4: "Corazón",
  5: "Diamante",
};
const emociones = {
  angry: "Enojado/a",
  disgusted: "Disgustado/a",
  fearful: "Asustado/a",
  happy: "Feliz",
  neutral: "Neutral",
  sad: "Triste",
  surprised: "Sorprendido/a"
};

const generos = {
  male: "Masculino",
  female: "Femenino"
};

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("./models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("./models"),
  faceapi.nets.faceExpressionNet.loadFromUri("./models"),
  faceapi.nets.ageGenderNet.loadFromUri("./models")
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      const video = document.getElementById("video");
      video.srcObject = stream;
    })
    .catch(function (error) {
      console.error("Ocurrió un error al acceder a la cámara: " + error);
    });
}

function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);

video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    if (resizedDetections && Object.keys(resizedDetections).length > 0) {
      const age = resizedDetections.age;
      let interpolatedAge = interpolateAgePredictions(age);
      let roundAge = Math.round(interpolatedAge);
      const gender = resizedDetections.gender;
      const expressions = resizedDetections.expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).filter(
        item => expressions[item] === maxValue
      );
      document.getElementById("age").innerText = `Edad - ${roundAge}`;
      document.getElementById("gender").innerText = `Género - ${generos[gender]}`;
      document.getElementById("emotion").innerText = `Emoción - ${emociones[emotion[0]]}`;

      const faceLandmarks = resizedDetections.landmarks;
      const faceType = determineFaceType(faceLandmarks);
      document.getElementById("faceType").innerText = `Tipo rostro - ${faceTypes[faceType]}`;
    }
  }, 10);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}

function determineFaceType(faceLandmarks) {
  const jawline = faceLandmarks.getJawOutline();
  const faceWidth = jawline[jawline.length - 1].x - jawline[0].x;
  const faceHeight = jawline[jawline.length - 1].y - jawline[0].y;

  const faceRatio = faceWidth / faceHeight;
  const faceArea = faceWidth * faceHeight;

  if (faceRatio > 1.3) {
    return 3; // Cuadrado
  } else if (faceRatio < 0.95) {
    if (faceArea < 9000) {
      return 1; // Redondo
    } else {
      return 2; // Ovalado
    }
  } else {
    if (faceArea < 10000 && faceWidth > 1.1 * faceHeight && faceRatio < 0.85) {
      return 5; // Diamante
    } else if (faceArea > 10000 && faceWidth < faceHeight && faceRatio > 0.85) {
      return 4; // Corazón
    } else {
      return 0; // Indefinido
    }
  }
}

const redirectButton = document.getElementById("redirectButton");
redirectButton.addEventListener("click", () => {
  const faceType = document.getElementById("faceType").innerText;
  if (faceType.includes("Cuadrado")) {
    window.location.href = "rostrocuadrado.html";
  } else if (faceType.includes("Redondo")) {
    window.location.href = "ProbadorV.html";
  } else {
    window.location.href = "otrostiporostro.html";
  }
});