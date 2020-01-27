const hideJug = () => {
  const jug = document.querySelector('#jug');
  jug.style.visibility = 'hidden';
  setTimeout(() => {
    jug.style.visibility = 'visible';
  }, 1000);
};
