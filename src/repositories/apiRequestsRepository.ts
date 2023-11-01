import {ApiRequestModel} from "../db/db"
import {APIRequestsCountType} from "../types/generalTypes";

export class ApiRequestRepository {
  async addAPIRequest(newRequest: APIRequestsCountType): Promise<boolean> {
    const apiRequestsCountInstance = new ApiRequestModel()

    apiRequestsCountInstance.ip = newRequest.ip
    apiRequestsCountInstance.URL = newRequest.URL
    apiRequestsCountInstance.date = newRequest.date

    await apiRequestsCountInstance.save()

    return true
  }

  async getCountApiRequestToOneEndpoint(URL: string, ip: string, date: Date): Promise<number> {
    const blogsCount = await ApiRequestModel
      .countDocuments({URL, ip, date: {$gte: date}})

    return blogsCount
  }
}