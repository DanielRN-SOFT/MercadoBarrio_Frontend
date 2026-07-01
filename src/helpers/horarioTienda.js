// src/utils/horarioTienda.js
const BOGOTA_OFFSET_MIN = 5 * 60; // Bogotá = UTC-5, sin horario de verano

const getBogotaNow = () => {
  const now = new Date();
  const bogotaTime = new Date(now.getTime() - BOGOTA_OFFSET_MIN * 60 * 1000);
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return {
    weekDay: weekDays[bogotaTime.getUTCDay()],
    minutes: bogotaTime.getUTCHours() * 60 + bogotaTime.getUTCMinutes(),
  };
};

const getBogotaMinutesFromTimeField = (value) => {
  const d = new Date(value);
  const utcMinutesOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
  return (utcMinutesOfDay - BOGOTA_OFFSET_MIN + 1440) % 1440;
};

export const estaAbierto = (schedules = []) => {
  const { weekDay: today, minutes: currentMinutes } = getBogotaNow();

  return schedules
    .filter((s) => s.status === "Active" && s.weekDay === today)
    .some((s) => {
      const startMin = getBogotaMinutesFromTimeField(s.startTime);
      const endMin = getBogotaMinutesFromTimeField(s.endTime);

      if (endMin < startMin) {
        return currentMinutes >= startMin || currentMinutes <= endMin;
      }
      return currentMinutes >= startMin && currentMinutes <= endMin;
    });
};
