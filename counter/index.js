let count = 0;
const countElement = document.getElementById('count');
const countPlusButton = document.getElementById('plus');
const countMinusButton = document.getElementById('minus');

countPlusButton.addEventListener('click', () => {
  count++;
  countElement.innerText = count;
});

countMinusButton.addEventListener('click', () => {
  count > 0 && count--;
  countElement.innerText = count;
});
