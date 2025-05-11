import React from "react";

const Live = () => {
  // Mock data for active printers
  const activePrinters = [
    {
      id: 1,
      name: "Printer 1",
      status: "Printing",
      progress: 75,
      streamUrl: "https://via.placeholder.com/300x200",
    },
    {
      id: 2,
      name: "Printer 2",
      status: "Idle",
      progress: 0,
      streamUrl: "https://via.placeholder.com/300x200",
    },
    {
      id: 3,
      name: "Printer 3",
      status: "Completed",
      progress: 100,
      streamUrl: "https://via.placeholder.com/300x200",
    },
  ];

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-heading mb-4 text-center">
        Live! Printing Dashboard
      </h1>
      <p className="text-center text-fontBlack mb-6">
        Monitor your prints in real-time and check printer statuses below.
      </p>

      {/* User Project Highlight */}
      <section className="bg-secondaryGray p-4 rounded-md shadow-md mb-6">
        <h2 className="text-xl font-subheading mb-2">Your Current Print</h2>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <img
            src="https://via.placeholder.com/300x200"
            alt="User Print Stream"
            className="rounded-md shadow-md w-full md:w-1/2"
          />
          <div className="w-full md:w-1/2">
            <p className="text-sm font-paragraph">
              Printer: <strong>Printer 1</strong>
            </p>
            <p className="text-sm font-paragraph">
              Status: <strong>Printing</strong>
            </p>
            <p className="text-sm font-paragraph">Progress:</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mt-1">
              <div
                className="bg-primaryTeal h-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stream Grid */}
      <section>
        <h2 className="text-2xl font-subheading mb-4">Active Printers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePrinters.map((printer) => (
            <div key={printer.id} className="bg-white rounded-md shadow-md p-4">
              <img
                src={printer.streamUrl}
                alt={`Stream for ${printer.name}`}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h3 className="text-lg font-subheading mb-1">{printer.name}</h3>
              <p className="text-sm font-paragraph">
                Status: <strong>{printer.status}</strong>
              </p>
              <p className="text-sm font-paragraph">Progress:</p>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mt-1">
                <div
                  className={`h-full ${printer.status === "Completed" ? "bg-green-400" : "bg-primaryTeal"}`}
                  style={{ width: `${printer.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Live;
