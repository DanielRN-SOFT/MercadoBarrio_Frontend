import React from "react";

const Label = ({ label, id }) => {
  return (
    <label id={id} className="label pb-1">
      <span className="label-text font-label-md text-label-md text-on-surface">
        {label}
      </span>
    </label>
  );
};

export default Label;
