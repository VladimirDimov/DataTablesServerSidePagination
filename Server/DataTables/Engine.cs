﻿namespace DataTables
{
    using System;
    using System.Linq;
    using System.Web.Mvc;
    using CommonProviders;
    using Models.Request;
    using ProcessDataProviders;
    using ProcessDataProviders.Contracts;
    /// <summary>
    /// Application Engine
    /// </summary>
    internal class Engine
    {
        private RequestParamsManager requestParamsManager;
        private IProcessData filterProvider;
        private IProcessData sortProvider;
        private GetIdentifiersProvider getIdentifiersProvider;
        private JsonProvider jsonProvider;

        public Engine()
        {
            this.requestParamsManager = new RequestParamsManager();
            this.filterProvider = new FilterProvider();
            this.sortProvider = new SortProvider();
            this.getIdentifiersProvider = new GetIdentifiersProvider();
            this.jsonProvider = new JsonProvider();
        }

        /// <summary>
        /// Catch passed parameters and apply all providers on the IQueryable collection
        /// </summary>
        /// <param name="filterContext"></param>
        public void Run(ActionExecutedContext filterContext)
        {
            // Get request model
            RequestModel requestModel = this.requestParamsManager.GetRequestModel(filterContext);

            // Get data generic type
            Type dataGenericType = requestModel.Data.GetType().GetGenericArguments().FirstOrDefault();

            // Filtered Data
            IQueryable<object> filteredData = this.filterProvider.Execute(requestModel.Data, requestModel, dataGenericType);
            // Ordered Data
            IQueryable<object> sortedData = this.sortProvider.Execute(filteredData, requestModel, dataGenericType);

            // Identifiers collection
            IQueryable identifiers = this.getIdentifiersProvider.Execute(sortedData, requestModel, dataGenericType);

            // Paged Data
            var pageData = sortedData
                .Skip((requestModel.Page - 1) * requestModel.PageSize)
                .Take(requestModel.PageSize);

            // Set JSON Result
            var resultObj = new
            {
                identifiers = identifiers,
                data = pageData,
                rowsNumber = filteredData.Count()
            };

            var jsonResult = jsonProvider.GetJsonResult(resultObj);

            // Set result
            filterContext.Result = jsonResult;
        }
    }
}
