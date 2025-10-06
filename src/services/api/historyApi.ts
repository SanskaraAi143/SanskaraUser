import api from './sanskaraApi';
import { HistoryResponse } from '../../types/history';

interface GetHistoryParams {
  sessionId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  eventTypesFilter?: Array<'message' | 'artifact_upload' | 'system_event'>;
}

export const getSessionHistory = async (params: GetHistoryParams): Promise<HistoryResponse> => {
  try {
    const response = await api.get(`/sessions/${params.sessionId}/history`, {
      params: {
        start_date: params.startDate,
        end_date: params.endDate,
        limit: params.limit,
        offset: params.offset,
        event_types_filter: params.eventTypesFilter?.join(','),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching session history:', error);
    throw error;
  }
};