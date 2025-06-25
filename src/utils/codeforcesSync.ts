import { schedule, ScheduledTask } from 'node-cron';
import Student, { IStudent } from '../models/Student';
import { fetchUserInfo, fetchUserRating, fetchUserStatus } from './codeforcesApi';
import sendEmail from './sendEmail';

export const syncCodeforcesData = async (studentId?: string) => {
  try {
    const query = studentId ? { _id: studentId } : {};
    const students = await Student.find(query);
    console.log(`Found ${students.length} students to sync`);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const student of students) {
      try {
        console.log(`Syncing data for ${student.codeforcesHandle}`);

        const userInfo = await fetchUserInfo(student.codeforcesHandle);
        const contestHistory = await fetchUserRating(student.codeforcesHandle);
        let submissions = await fetchUserStatus(student.codeforcesHandle);
        let from = 1001;
        while (submissions.length >= 1000) {
          const moreSubmissions = await fetchUserStatus(student.codeforcesHandle, from, 1000);
          submissions = submissions.concat(moreSubmissions);
          from += 1000;
          if (moreSubmissions.length < 1000) break;
        }

        student.currentRating = userInfo.rating || 0;
        student.maxRating = userInfo.maxRating || 0;
        student.lastSynced = now;

        student.contestHistory = contestHistory.map((contest: any) => ({
          contestId: contest.contestId,
          contestName: contest.contestName,
          rank: contest.rank,
          ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
          oldRating: contest.oldRating,
          newRating: contest.newRating,
        }));

        student.submissions = submissions.map((submission: any) => ({
          submissionId: submission.id,
          contestId: submission.contestId || 0,
          problemIndex: submission.problem.index,
          problemName: submission.problem.name,
          problemRating: submission.problem.rating || 0,
          creationTimeSeconds: submission.creationTimeSeconds,
          verdict: submission.verdict,
        }));

        const recentSubmissions = submissions.filter(
          (sub: any) => sub.creationTimeSeconds * 1000 >= sevenDaysAgo.getTime(),
        );
        if (recentSubmissions.length === 0 && student.sendReminder) {
          await sendEmail(
            student.email,
            'Get Back to Problem Solving!',
            `Hi ${student.name},\n\nYou haven’t submitted any problems on Codeforces in the last 7 days. Time to get back to solving!`,
          );
          student.reminderEmailsSent = (student.reminderEmailsSent || 0) + 1;
          console.log(`Sent reminder email to ${student.email}`);
        }

        await student.save();
        console.log(`Successfully synced data for ${student.codeforcesHandle}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error syncing data for ${student.codeforcesHandle}:`, errorMessage);
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error in syncCodeforcesData:', errorMessage);
  }
};

// Test mode: Every minute
let cronTime = '0 0 2 * * *'; // Revert to '0 0 2 * * *' for daily 2 AM UTC
let scheduledTask: ScheduledTask | null = null;

export const startCodeforcesSyncJob = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('Stopped previous cron job');
  }
  scheduledTask = schedule(cronTime, () => syncCodeforcesData(), {
    name: 'daily-codeforces-sync',
    timezone: 'UTC',
  });
  console.log(`Started cron job with schedule: ${cronTime}`);
};

export const updateCronSchedule = (newTime: string, frequency: 'daily' | 'weekly' = 'daily') => {
  cronTime = newTime;
  if (frequency === 'weekly') {
    cronTime = `${newTime.split(' ').slice(0, 3).join(' ')} * * 0`;
  }
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('Stopped previous cron job');
  }
  scheduledTask = schedule(cronTime, () => syncCodeforcesData(), {
    name: 'codeforces-sync',
    timezone: 'UTC',
  });
  console.log(`Updated cron job with schedule: ${cronTime}`);
};