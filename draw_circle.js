function createSegmentedCircle({
  segments,
  actualCount,
  text,
  ringThickness,
  textAbove,
  textBelow,
  divId,
}) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const width = 200; // width and height of the svg element
  const height = 200;
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
  createTextElement(svg, textBelow, centerX, centerY, '12', 30);

  // check id divId is null or empty if not add the svg to the div with the id
  if (divId && divId !== '') {
    document.getElementById(divId).innerHTML = svg.outerHTML;
  } else {
    document.body.appendChild(svg);
  }
}
