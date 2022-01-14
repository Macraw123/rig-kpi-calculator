import axios from "axios";


const acadAPI = axios.create({
    baseURL : "https://academic-slc.apps.binus.ac.id/api/e1c72423994bffe635ead59f770da6a2ea53b95ac2ff5d60cefdab5529038986/",
    headers: {
        'Content-type' : "application/json",
        "Accept" : "*/*"
    }
})

export const getAssistantProjects = async (semesterId,userId,type) => acadAPI.post(
    `kpi/${semesterId}/${userId}/${type}`
  );

export const getAssistantQualification =  async (semesterId,userId) => acadAPI.post(
    `kpi/${semesterId}/${userId}/qualification`
 );