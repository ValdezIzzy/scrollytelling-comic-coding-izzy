// function drawChapter6Guides() {
//   const grid = document.querySelector("#chapter-6 .section__content");
//   const svg = grid.querySelector(".svg-guides");

//   if (!grid || !svg) return;

//   // get real pixel box for the grid
//   const rect = grid.getBoundingClientRect();

//   // match SVG to the grid in pixels
//   svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
//   svg.setAttribute("preserveAspectRatio", "none");

//   // clear old lines
//   svg.innerHTML = "";

//   const styles = getComputedStyle(grid);

//   // computed px lists (like "150px 220px 220px ...")
//   const rows = styles.gridTemplateRows.split(" ").map(v => parseFloat(v));
//   const cols = styles.gridTemplateColumns.split(" ").map(v => parseFloat(v));

//   const gapX = parseFloat(styles.columnGap);
//   const gapY = parseFloat(styles.rowGap);

//   // helper to create a line
//   const addLine = (x1, y1, x2, y2) => {
//     const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
//     line.setAttribute("x1", x1);
//     line.setAttribute("y1", y1);
//     line.setAttribute("x2", x2);
//     line.setAttribute("y2", y2);
//     line.classList.add("guide");
//     svg.appendChild(line);
//   };

//   // --- vertical boundaries (double lines around column gaps) ---
//   let x = 0;
//   addLine(0, 0, 0, rect.height);                  // left edge
//   for (let i = 0; i < cols.length - 1; i++) {
//     x += cols[i];
//     addLine(x, 0, x, rect.height);                // right edge of col i
//     addLine(x + gapX, 0, x + gapX, rect.height);  // left edge of next col (gap rail)
//     x += gapX;
//   }
//   addLine(rect.width, 0, rect.width, rect.height); // right edge

//   // --- horizontal boundaries (double lines around row gaps) ---
//   let y = 0;
//   addLine(0, 0, rect.width, 0);                   // top edge
//   for (let i = 0; i < rows.length - 1; i++) {
//     y += rows[i];
//     addLine(0, y, rect.width, y);                 // bottom edge of row i
//     addLine(0, y + gapY, rect.width, y + gapY);   // top edge of next row (gap rail)
//     y += gapY;
//   }
//   addLine(0, rect.height, rect.width, rect.height); // bottom edge
// }

// // run now + keep it correct on resize
// window.addEventListener("load", drawChapter6Guides);
// window.addEventListener("resize", drawChapter6Guides);