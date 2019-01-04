fjsx.createSvgElement("circle", null);
fjsx.createSvgElement(
  "svg",
  {
    width: "400px",
    height: "300px",
    viewBox: "0 0 400 300",
    xmlns: "http://www.w3.org/2000/svg"
  },
  fjsx.createSvgElement(
    "desc",
    null,
    "This example uses the 'switch' element to provide a fallback graphical representation of a paragraph, if XHTML is not supported."
  ),
  fjsx.createSvgElement(
    "foreignObject",
    {
      width: "100",
      height: "50",
      requiredExtensions: "http://www.w3.org/1999/xhtml"
    },
    fidan(
      "body",
      {
        xmlns: "http://www.w3.org/1999/xhtml"
      },
      fidan(
        "p",
        null,
        "Here is a paragraph that requires word wrap"
      )
    )
  )
);
