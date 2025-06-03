// src/components/YouTubeSidebar.js
import React from "react";

const newsItems = [
  {
    title: "World's Tallest 3D-Printed Tower Unveiled in Switzerland",
    url: "https://nypost.com/2025/06/02/real-estate/see-the-tallest-3d-printed-tower-in-the-world/",
  },
  {
    title: "Treadmill Transformed into Giant 3D Printer with Endless Bed",
    url: "https://www.tomshardware.com/3d-printing/treadmill-modded-into-giant-3d-printer-with-an-endless-print-bed-size-taking-3d-print-sizing-to-the-extreme",
  },
  {
    title: "3D Printing Trends for 2025: Executive Survey Insights",
    url: "https://3dprintingindustry.com/news/3d-printing-trends-for-2025-executive-survey-of-leading-additive-manufacturing-companies-236247/",
  },
  {
    title:
      "Australia's First 3D-Printed Multistorey Home Addresses Housing Crisis",
    url: "https://www.news.com.au/technology/innovation/australias-first-3d-printed-multistorey-home-might-be-an-answer-to-housing-crisis/news-story/20a95db06b45200e5e14abe446420f60",
  },
  {
    title: "Big Sneaker Brands and the 3D-Printed Footwear Revolution",
    url: "https://www.wired.com/story/big-sneaker-brands-promised-a-3d-printed-revolution-these-are-the-disrupters-making-it-happen",
  },
];

const YouTubeSidebar = () => {
  return (
    <section className="bg-gray-300 shadow-md rounded-md p-4 w-full md:w-1/4">
      <h2 className="text-xl font-subheading font-bold mb-3 border-b pb-2">
        🆕 3D Printing Trends
      </h2>
      <ul className="text-sm font-paragraph space-y-2 list-disc list-inside">
        {newsItems.map((item, index) => (
          <li key={index}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default YouTubeSidebar;
