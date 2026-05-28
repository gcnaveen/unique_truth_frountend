import axios from "axios";
import { API_URL } from "../../config";

const questionaryClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const authHeaders = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

export const QuestionaryService = Object.freeze({
  SKILLS_BEHIND_STUDIES: "Skills Behind Studies",
  BEHAVIORAL_AWARENESS: "Behavioral Awareness",
  RELATIONSHIP_AWARENESS: "Relationship Awareness",
  TALENT_AWARENESS: "Talent Awareness",
  COMPLETE_PACKAGE: "Complete Package",
});

export const getQuestionaries = async (token) => {
  const response = await questionaryClient.get("/questioniries", authHeaders(token));
  return response.data;
};

export const createQuestionary = async (token, payload) => {
  const response = await questionaryClient.post(
    "/questioniries",
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getQuestionaryById = async (token, questioniriesId) => {
  const response = await questionaryClient.get(
    `/questioniries/${questioniriesId}`,
    authHeaders(token),
  );
  return response.data;
};

export const updateQuestionary = async (token, questioniriesId, payload) => {
  const response = await questionaryClient.put(
    `/questioniries/${questioniriesId}`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const getQuestionariesByService = async (token, service) => {
  const response = await questionaryClient.get(
    `/questioniries/service/${encodeURIComponent(service)}`,
    authHeaders(token),
  );
  return response.data;
};

export const createQuestionaryEnquiry = async (token, questioniriesId, payload) => {
  const response = await questionaryClient.post(
    `/questioniries/${questioniriesId}/enquiries`,
    payload,
    authHeaders(token),
  );
  return response.data;
};

export const updateQuestionaryEnquiry = async (token, questioniriesId, payload) => {
  const response = await questionaryClient.put(
    `/questioniries/${questioniriesId}/enquiries`,
    payload,
    authHeaders(token),
  );
  return response.data;
};
