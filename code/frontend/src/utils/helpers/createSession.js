// Helper function to toggle the day
export const toggleDay = (
  day,
  setDay,
  selectedDays,
  setSelectedDays,
  index,
) => {
  if (day === 'default') {
    setDay('primary');
    let temp = selectedDays;
    temp[index] = true;
    setSelectedDays(temp);
  } else {
    setDay('default');
    let temp = selectedDays;
    temp[index] = false;
    setSelectedDays(temp);
  }
};

// Helper function to get staff names
export const getStaffNames = (otherStaff) => {
  let names = [];
  for (let i = 0; i < otherStaff.length; i++) {
    names.push({
      id: otherStaff[i].accountid,
      title: otherStaff[i].username,
    });
  }
  return names;
};
