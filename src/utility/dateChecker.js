import moment from "moment";


function isValidDate(date) {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()); // Returns true if valid
  }


  function getStartAndEndOfDay(dateString) {
    // Check if the date is valid
    if (!moment(dateString, "YYYY-MM-DD", true).isValid()) {
      throw new Error("Invalid date provided");
    }
  
    // Get start of the day (00:00:00)
    const startOfDay = moment(dateString).startOf("day").format("YYYY-MM-DD HH:mm:ss").toString();
  
    // Get end of the day (23:59:59.999)
    const endOfDay = moment(dateString).endOf("day").format("YYYY-MM-DD HH:mm:ss").toString();
  
    return { dateString, startOfDay, endOfDay };
  }
  
  
  // Example usage
 
  console.log(getStartAndEndOfDay("2024-11-22"))
  
  export {isValidDate,getStartAndEndOfDay};