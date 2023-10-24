import {apiRequestsCountCollections} from "../db/db"
import {APIRequestsCountType} from "../types/generalTypes";

export const apiRequestRepository = {
  async addAPIRequest(newRequest: APIRequestsCountType): Promise<boolean> {
    return !!await apiRequestsCountCollections.insertOne({...newRequest})
  },

  async getCountApiRequestToOneEndpoint(URL: string, ip: string, date: Date): Promise<number> {
    return await apiRequestsCountCollections.countDocuments(
      {URL, ip, date: {$gte: date}}
    )
  }
}