const hideJug = () => {
  const jug = document.querySelector('#jug');
  jug.style.visibility = 'hidden';
  const timePeriod = 1000;
  setTimeout(() => {
    jug.style.visibility = 'visible';
  }, timePeriod);
};
