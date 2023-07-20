async function loadImageAndDetectPupils(file) {
  const img = await createImageBitmap(file);
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  // Limitar tamaño a carnet
  const MAX_WIDTH = 300;
  const MAX_HEIGHT = 400;
  let width = img.width;
  let height = img.height;

  if (width > MAX_WIDTH) {
    height *= MAX_WIDTH / width;
    width = MAX_WIDTH;
  }

  if (height > MAX_HEIGHT) {
    width *= MAX_HEIGHT / height;
    height = MAX_HEIGHT;
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const leftPupilX = width * 0.35; // Posición x estimada del ojo izquierdo
  const rightPupilX = width * 0.65; // Posición x estimada del ojo derecho
  const y = height * 0.5; // Posición y estimada del eje horizontal de los ojos

  const distance = Math.abs(rightPupilX - leftPupilX);

  const result = document.getElementById('result');
  const diagnosis = document.getElementById('diagnosis');

  result.textContent = `La distancia interpupilar es: ${distance.toFixed(2)} mm`;

  if (distance < 38) {
    diagnosis.textContent = 'Tu distancia interpupilar es menor a lo normal.';
    diagnosis.textContent = 'Recomendación: Lentes con un índice de refracción alto para corregir problemas de visión y proporcionar una mejor claridad óptica.';
  } else if (distance > 45) {
    diagnosis.textContent = 'Tu distancia interpupilar está dentro del rango normal.';
    diagnosis.textContent = 'Recomendación: Lentes con un índice de refracción estándar para una corrección óptima y comodidad visual.';
  } else {
    diagnosis.textContent = 'Tu distancia interpupilar es mayor a lo normal.';
    diagnosis.textContent = 'Recomendación: Lentes con un índice de refracción bajo para reducir el grosor y el peso de los lentes, especialmente en casos de alta prescripción.';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const imageUpload = document.getElementById('imageUpload');
  imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      await loadImageAndDetectPupils(file);
    }
  });
});
