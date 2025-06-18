import axios from 'axios';

const codeforcesApi = axios.create({
  baseURL: 'https://codeforces.com/api',
  headers: {
    'User-Agent': process.env.CODEFORCES_USER_AGENT || 'StudentProgressSystem/1.0',
  },
});

export const fetchUserInfo = async (handle: string) => {
  try {
    const response = await codeforcesApi.get(`/user.info?handles=${handle}`);
    if (response.data.status !== 'OK') {
      throw new Error(response.data.comment || 'Failed to fetch user info');
    }
    return response.data.result[0];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching user info for ${handle}: ${error.message}`);
    } else {
      throw new Error(`Error fetching user info for ${handle}: ${String(error)}`);
    }
  }
};

export const fetchUserRating = async (handle: string) => {
  try {
    const response = await codeforcesApi.get(`/user.rating?handle=${handle}`);
    if (response.data.status !== 'OK') {
      throw new Error(response.data.comment || 'Failed to fetch user rating');
    }
    return response.data.result;
  }  catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching user info for ${handle}: ${error.message}`);
    } else {
      throw new Error(`Error fetching user info for ${handle}: ${String(error)}`);
    }
  }
};

export const fetchUserStatus = async (handle: string, from: number = 1, count: number = 1000) => {
  try {
    const response = await codeforcesApi.get(`/user.status?handle=${handle}&from=${from}&count=${count}`);
    if (response.data.status !== 'OK') {
      throw new Error(response.data.comment || 'Failed to fetch user status');
    }
    return response.data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error fetching user info for ${handle}: ${error.message}`);
    } else {
      throw new Error(`Error fetching user info for ${handle}: ${String(error)}`);
    }
  }
};