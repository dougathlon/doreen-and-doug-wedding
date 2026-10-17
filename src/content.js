export const wedding = {
  names: "Doreen & Doug",
  date: "Saturday 17 July 2027",
  friday: "Friday 16 July 2027",
  ceremonyTime: "1pm",
  church: "St Michael & All Angels",
  churchAddress: "Church Street, Appleby Magna",
  school: "Sir John Moore School",
  schoolAddress: "101 Top Street, Appleby Magna, DE12 7AH",
};

export const mapLink = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

export const hotels = [
  {
    name: "The Appleby Inn",
    place: "Appleby Parva · DE12 7AP",
    detail: "An inn with guest rooms, close to the village. Enquire directly about rooms for the Friday and Saturday nights.",
    url: "https://www.applebyinn.co.uk/",
  },
  {
    name: "Appleby Park Hotel",
    place: "A444, Appleby Magna · DE12 7AP",
    detail: "A hotel by Junction 11 of the M42, with standard and family rooms. Please book directly with the hotel.",
    url: "https://www.applebyparkhotel.com/",
  },
];
