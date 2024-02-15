import { store } from "../store.js";
import { createNewsLetter, storeSelectedGenreValue, UpdateCreateInProgressNew, storeUserArticleInProgress, UpdatePageMappingData, updateIsEmailValid, updateDiversitySliderValuePersonalized,UpdateCreateInProgress,getUserId, updateNewsLetterTemplateData, clearArticlePageData, maintainGenAiCheck,storeNewArticleContent, getGenreTypes, interactionCheck, getBreakingNews, getArticleById, getGenreNews, createNewArticle, getArticleByUser, updateDiversitySliderValue } from "../actions/home.action.jsx";

export const handleGetBreakingNews = async (diversity = 5) => {
  return await store.dispatch(getBreakingNews(diversity));
}

export const handleGetGenreNews = async (genre = "", page = 1) => {
  return await store.dispatch(getGenreNews(genre,page));
}

export const handleCreateNewArticle = async (data = "") => {
  return await store.dispatch(createNewArticle(data));
}

export const handleGetArticlesByUser = async (userId = "") => {
  await store.dispatch(getArticleByUser(userId));
}

export const handleSetGettingUserArticleInProgress = async (newValue) => {
  await store.dispatch(storeUserArticleInProgress(newValue));
}

export const handleUpdateDiversitySliderValue = async (diversityValue) => {
  await store.dispatch(updateDiversitySliderValue(diversityValue));
}

export const handleUpdateDiversitySliderValuePersonalized = async (diversityValue) => {
  await store.dispatch(updateDiversitySliderValuePersonalized(diversityValue));
}

export const handleUpdateCreateInProgressNew = async (createInProgressNew) => {
  await store.dispatch(UpdateCreateInProgressNew(createInProgressNew));
}

export const handleUpdateCreateInProgress = async (createInProgress) => {
  await store.dispatch(UpdateCreateInProgress(createInProgress));
}

export const handleStorePersonalPageDataForDataMapped = async (checkBoxValue, sliderValue) => {
  await store.dispatch(UpdatePageMappingData(checkBoxValue, sliderValue));
}


export const handleUpdateNewsLetterTemplateData = async (newsLetterTemplateData) => {
  await store.dispatch(updateNewsLetterTemplateData(newsLetterTemplateData));
}


export const handleCreateNewsLetter = async (data) => {
  await store.dispatch(createNewsLetter(data));
}

export const handleGetArticleById = async (articleId, clusterId) => {
  return await store.dispatch(getArticleById(articleId, clusterId));
}

export const handleInteractionCheck = async (data) => {
  await store.dispatch(interactionCheck(data));
}

export const handleGetGenreTypes = async () => {
  await store.dispatch(getGenreTypes());
}

export const handleMaintainNewArticleContent = async (data = "") => {
  await store.dispatch(storeNewArticleContent(data));
}

export const handleStoreSelectedGenreValue = async (data) => {
  await store.dispatch(storeSelectedGenreValue (data));
}

export const handleClearArticlePageData = async () => {
  await store.dispatch(clearArticlePageData());
}

export const handleMaintainGenAiCheck = async (checkValue) =>{
  await store.dispatch(maintainGenAiCheck(checkValue));
}

export const handleUpdateIsEmailValid = async (value) => {
  await store.dispatch(updateIsEmailValid(value));
}
export const handleGetUserId = async (value) => {
  await store.dispatch(getUserId(value));
}



