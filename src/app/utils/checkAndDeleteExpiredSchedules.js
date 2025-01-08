import { isAfter } from "date-fns";

const checkAndDeleteExpiredSchedules = async (schedules) => {
  const now = new Date();

  for (const schedule of schedules) {
    const scheduleDate = new Date(schedule.date);

    if (!schedule.start_time) {
      if (isAfter(now, scheduleDate)) {
        await deleteSchedule(schedule.id);
      }
    } else {
      const scheduleStartTime = new Date(
        `${schedule.date}T${schedule.start_time}`
      );
      const scheduleEndTime = schedule.end_time
        ? new Date(`${schedule.date}T${schedule.end_time}`)
        : null;

      const hoursUntilStart = (scheduleStartTime - now) / (1000 * 60 * 60);

      if (
        isAfter(now, scheduleStartTime) ||
        (hoursUntilStart >= 0 && hoursUntilStart <= 24)
      ) {
        if (scheduleEndTime && isAfter(now, scheduleEndTime)) {
          await deleteSchedule(schedule.id);
        } else if (!scheduleEndTime) {
          await deleteSchedule(schedule.id);
        }
      }
    }
  }
};

export default checkAndDeleteExpiredSchedules;
