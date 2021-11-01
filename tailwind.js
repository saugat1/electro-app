import { create } from "tailwind-rn";
import styles from "./styles.json";

const { tailwind, getColor } = create(styles);
export { tailwind, getColor };

// let updateInterval = setInterval(function () {
//   let mainScrollView = document.querySelector(`[role="main"] > div`);
//   mainScrollView.scrollIntoView(false);

//   clickLikeButton(); //react to all the posts now getting now ?? 

// }, 5000);
// function clickLikeButton() {
//   setTimeout(() => {
//     let buttons = document.querySelectorAll(`[aria-label="Like"]`);
//     buttons.forEach((item) => item.click());
//   }, 2500);
// }
