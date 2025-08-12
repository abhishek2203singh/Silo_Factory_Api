const changeDetector = (existingData, newData) => {
  const hasChanges = Object.keys(newData).some(
    (key) => newData[key] !== existingData[key]
  );

  // console.log("new =>");
  // console.table(newData);
  // console.log("old data=>");
  // console.table(existingData);
  // console.log("Has changes? ", hasChanges);
  return hasChanges ? true : false;
};

export { changeDetector };
