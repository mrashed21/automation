import { baseApi } from "@/lib/api-client";
import type { AutomationRuleDto, AutomationRunDto, AutomationStatusDto } from "@repo/types";
import type { CreateAutomationRuleDto, UpdateAutomationRuleDto } from "@repo/validation";

export const automationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAutomationRules: builder.query<AutomationRuleDto[], void>({
      query: () => "/automation/rules",
      providesTags: [{ type: "Automation", id: "rules" }],
    }),

    createAutomationRule: builder.mutation<AutomationRuleDto, CreateAutomationRuleDto>({
      query: (data) => ({
        url: "/automation/rules",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Automation", id: "rules" }],
    }),

    updateAutomationRule: builder.mutation<
      AutomationRuleDto,
      { id: string; data: UpdateAutomationRuleDto }
    >({
      query: ({ id, data }) => ({
        url: `/automation/rules/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [{ type: "Automation", id: "rules" }],
    }),

    deleteAutomationRule: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/automation/rules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Automation", id: "rules" }],
    }),

    toggleAutomationRule: builder.mutation<
      AutomationRuleDto,
      { id: string; isEnabled: boolean }
    >({
      query: ({ id, isEnabled }) => ({
        url: `/automation/rules/${id}/toggle`,
        method: "POST",
        body: { isEnabled },
      }),
      invalidatesTags: [{ type: "Automation", id: "rules" }],
    }),

    triggerAutomationRule: builder.mutation<AutomationRunDto, string>({
      query: (id) => ({
        url: `/automation/rules/${id}/trigger`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Automation", id: "runs" }],
    }),

    listAutomationRuns: builder.query<AutomationRunDto[], { ruleId?: string; limit?: number }>({
      query: ({ ruleId, limit } = {}) => {
        const params = new URLSearchParams();
        if (ruleId) params.set("ruleId", ruleId);
        if (limit) params.set("limit", String(limit));
        const qs = params.toString();
        return `/automation/runs${qs ? `?${qs}` : ""}`;
      },
      providesTags: [{ type: "Automation", id: "runs" }],
    }),

    getAutomationStatus: builder.query<AutomationStatusDto, void>({
      query: () => "/automation/status",
      providesTags: [{ type: "Automation", id: "status" }],
    }),
  }),
});

export const {
  useListAutomationRulesQuery,
  useCreateAutomationRuleMutation,
  useUpdateAutomationRuleMutation,
  useDeleteAutomationRuleMutation,
  useToggleAutomationRuleMutation,
  useTriggerAutomationRuleMutation,
  useListAutomationRunsQuery,
  useGetAutomationStatusQuery,
} = automationApi;
