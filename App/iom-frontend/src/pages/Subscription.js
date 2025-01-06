import React from "react";

const Subscription = () => {
  return (
    <div className="flex-grow p-8 text-center bg-secondaryGray text-fontBlack font-paragraph">
      <h1 className="text-4xl font-heading mb-4">Subscription Plans</h1>
      <p className="text-lg font-paragraph mb-8">
        Choose a plan that fits your needs and take full advantage of Icepik's
        Octo Manager.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-md shadow-md bg-white">
          <h2 className="text-2xl font-subheading mb-2">Free Plan</h2>
          <p className="text-sm font-paragraph">
            Basic features for small projects.
          </p>
        </div>
        <div className="p-4 border rounded-md shadow-md bg-white">
          <h2 className="text-2xl font-subheading mb-2">Pro Plan</h2>
          <p className="text-sm font-paragraph">
            Advanced tools for growing needs.
          </p>
        </div>
        <div className="p-4 border rounded-md shadow-md bg-white">
          <h2 className="text-2xl font-subheading mb-2">Enterprise Plan</h2>
          <p className="text-sm font-paragraph">
            Complete solutions for businesses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
