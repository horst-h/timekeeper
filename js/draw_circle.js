function createSegmentedCircle({
  segments,
  actualCount,
  text,
  ringThickness,
  textAbove,
  textBelow,
  textBelow2, // 
  divId,
}) {
  const svgNS = 'http://www.w3.org/2000/svg';
  // width and height of the svg element

  const width = globals.svgRingWith || 200;
  const height = globals.svgRingHeight || 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 90;
  const innerRadius = outerRadius - ringThickness;
  const gap = 0.04; // gap between the segmants as a fraction of the circle

  // create a new svg element
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  function createSegmentPath(centerX, centerY, outerRadius, innerRadius, startAngle, endAngle, gap) {
    const outerStartX = centerX + outerRadius * Math.cos(startAngle);
    const outerStartY = centerY + outerRadius * Math.sin(startAngle);
    const outerEndX = centerX + outerRadius * Math.cos(endAngle);
    const outerEndY = centerY + outerRadius * Math.sin(endAngle);

    const innerStartX = centerX + innerRadius * Math.cos(endAngle);
    const innerStartY = centerY + innerRadius * Math.sin(endAngle);
    const innerEndX = centerX + innerRadius * Math.cos(startAngle);
    const innerEndY = centerY + innerRadius * Math.sin(startAngle);

    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
    return [
      'M',
      outerStartX,
      outerStartY,
      'A',
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      1,
      outerEndX,
      outerEndY,
      'L',
      innerStartX,
      innerStartY,
      'A',
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      0,
      innerEndX,
      innerEndY,
      'Z',
    ].join(' ');
  }

  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI) / segments;
    const startAngle = i * angle - Math.PI / 2 + gap / 2;
    const endAngle = (i + 1) * angle - Math.PI / 2 - gap / 2;

    const path = document.createElementNS(svgNS, 'path');
    const d = createSegmentPath(centerX, centerY, outerRadius, innerRadius, startAngle, endAngle, gap);
    path.setAttribute('d', d);
    path.setAttribute('fill', i < actualCount ? globals.ringPrimaryColor : globals.ringBaseColor);
    svg.appendChild(path);
  }

  // Draw the overtime circle
  if (actualCount > segments) {
    let extraSegments = actualCount - segments;
    const smallerOuterRadius = outerRadius - 13;
    const smallerInnerRadius = innerRadius - 13;

    for (let j = 0; j < extraSegments; j++) {
      const angle = (2 * Math.PI) / segments;
      const startAngle = j * angle - Math.PI / 2 + gap / 2;
      const endAngle = (j + 1) * angle - Math.PI / 2 - gap / 2;

      const path = document.createElementNS(svgNS, 'path');
      const d = createSegmentPath(centerX, centerY, smallerOuterRadius, smallerInnerRadius, startAngle, endAngle, gap);
      path.setAttribute('d', d);
      path.setAttribute('fill', globals.ringSecondaryColor); // TODO: use CSS variable
      svg.appendChild(path);
    }
  }


  // Create text elements in the center of the circle
  const fontFamily = 'Roboto';

  // function to create text elements in the svg
  function createTextElement(svg, content, x, y, fontSize, offsetY = 0) {
    const textElement = document.createElementNS(svgNS, 'text');
    textElement.setAttribute('x', x);
    textElement.setAttribute('y', y + offsetY);
    textElement.setAttribute('fill', 'grey');
    textElement.setAttribute('font-family', fontFamily);
    textElement.setAttribute('font-size', fontSize);
    textElement.setAttribute('dominant-baseline', 'middle');
    textElement.setAttribute('text-anchor', 'middle');
    textElement.textContent = content;
    svg.appendChild(textElement);
  }

  // Main center text
  createTextElement(svg, text, centerX, centerY, '32');

  // Smaller text above
  createTextElement(svg, textAbove, centerX, centerY, '12', -32);

  // Smaller text below
  // check if text below contains a linebreak and split it into two lines
  const textBelowLines = textBelow.split('\n');
  // loop throug array and add an offest to the y position
  textBelowLines.forEach((line, index) => {
    createTextElement(svg, line, centerX, centerY, '12', 30 + index * 14);
  });

  // call the function to create the details button if the details view is open
  const detailsButton = createDetailsButton(svgNS, width, height);
  svg.appendChild(detailsButton);

  // check id divId is null or empty if not add the svg to the div with the id
  if (divId && divId !== '') {
    document.getElementById(divId).innerHTML = svg.outerHTML;
  } else {
    document.body.appendChild(svg);
  }
}

// function to create the details button returns a svg for a given namespace
function createDetailsButton(svgNS, width, height) {
  // check if the details div is open
  const detailsDiv = document.getElementById('details');
  const detailsButton = document.createElementNS(svgNS, 'polygon');

  // if the details div is open create a button else return a empty svg
  if (!detailsDiv.classList.contains('open')) {
    // create a small action button in form if a traingle that points to the right on the lower right corner
    detailsButton.setAttribute('id', 'detailsButton');
    detailsButton.setAttribute('points', `${width - 10},${height - 10} ${width - 25},${height - 10} ${width - 10},${height - 25}`);
    detailsButton.setAttribute('fill', 'grey');
    detailsButton.setAttribute('onclick', 'toggleDetails()');
    // rotate the button by 45 degrees
    detailsButton.setAttribute('transform', `rotate(-45 ${width - 15} ${height - 15})`);
  }

  return detailsButton;
}
