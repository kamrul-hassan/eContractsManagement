with (helper)
{
	function _escape(s) { return s.replace(/'/g, '\\x27'); }
	function _echo(v) { helper.Control.WebView.EvaluateJavascript('_echo("' + v + '")'); }

	var alignmentId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@ALIGNMENT_ID");
	var customerId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@CUSTOMER_ID");
	var envRegionId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@REGION_ID");
	var tenantId = EnvironmentVariables.Instance.GetValue(bo.CreateParams.UserToken, "@TENANT");
	var ref_ID = Control.WebView.EvaluateJavascript("getOfflineParameter('regionFieldsData')");

	var callBoGuid = bo.CreateParams.ExtendedProperties["fromguid"];
	var callBO = ResurrectBusinessObject(callBoGuid, ".bo");
	var cust_Id = callBO.Data.GetValue("customer/customer_id");
	var employeeID = callBO.Data.GetValue("event/employee_id");

	var address = callBO.Data.GetValue("event_address/vc_display_address");
	//var adds= '{"address" :"' + address + '"}';
	//var custaddJson= '[' + adds + ']';

	/* var customerName="select customer_id as CUSTOMER_ID, name as NAME, external_id_1 as EXTERNAL_ID from customer where customer_id="+customerId+"";
	var customerReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
	customerReq.CreateParams["query_sql"] = customerName;
	var customerResp = DataRequest.Execute(customerReq);
	var customerTable = customerResp.Data.Tables['vt_query'];
	var customerJson = JsonSerializeTable(customerTable);

	// Employee Details
	var emp_email="select employee_id as EMPLOYEE_ID, email_address as EMAIL_ADDRESS, external_id_1 as EXTERNAL_ID from employee where employee_id="+employeeID+"";
	var emp_emailReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
	emp_emailReq.CreateParams["query_sql"] = emp_email;
	var emp_emailResp = DataRequest.Execute(emp_emailReq);
	var emp_emailTable = emp_emailResp.Data.Tables['vt_query'];
	var empemailJson = JsonSerializeTable(emp_emailTable);

	// To get CIP Code
	var cipcode="select customer_id as CUSTOMER_ID, text_1 as CIPCODE from customer_dynamic where table_id=1888002682614322 and customer_id="+customerId+"";
	var cipcodeReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
	cipcodeReq.CreateParams["query_sql"] = cipcode;
	var cipcodeResp = DataRequest.Execute(cipcodeReq);
	var cipcodeTable = cipcodeResp.Data.Tables['vt_query'];
	var cipcodeJson = JsonSerializeTable(cipcodeTable); */

	var custData = "select  " +
		"	text_1 as DOC_REFERENCE,  " +
		"	text_2 as FIELD_NAME,  " +
		"	text_3 as FIELD_LABEL,  " +
		"	text_4 as FIELD_INIT,  " +
		"	code_1 as DATA_TYPE,  " +
		"	code_2 as IS_VISIBLE,  " +
		"	code_3 as IS_MANDATORY,  " +
		"	code_4 as SORT_ORDER,  " +
		"	number_1 as LEFT,  " +
		"	number_2 as TOP,  " +
		"	number_3 as LENGTH,  " +
		"	number_4 as WIDTH,  " +
		"	number_5 as PAGE_NUMBER  " +
		"	from region_dynamic  " +
		"	where table_id=7888500000206170 and text_1='" + ref_ID + "' and region_id=" + envRegionId + " and tenant_id=" + tenantId + "";

	var custDataReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
	custDataReq.CreateParams["query_sql"] = custData;
	var custDataResp = DataRequest.Execute(custDataReq);
	var custDataTable = custDataResp.Data.Tables['vt_query'];
	//var custDataJson = JsonSerializeTable(custDataTable);

	//var tblData = JsonDeserializeTable(custDataJson);
	var tblcount = custDataTable.Rows.Count;

	var field = "";
	var query_para;
	var query_data;
	for (var i = 0; i < custDataTable.Rows.Count; i++)
	{
		var dataRow = custDataTable.Rows[i];
		if ((!System.String.IsNullOrEmpty(dataRow["FIELD_INIT"])) && (dataRow["FIELD_INIT"].Contains("/")))
		{
			var boMap = dataRow["FIELD_INIT"].toString();
			field = boMap.split("/");
			var table_name = field[0];
			var c1_name = field[1];

			// FxM | 2017-12-10 | Added customer_open_fields case
			if ((table_name == "customer") || (table_name == "customer_open_fields"))
			{
				query_para = customerId;
				query_data = "select " + "" + c1_name + "" + " as FIELD_INIT from " + table_name + " where customer_id=" + customerId + "";
			}
			else if (table_name == "employee")
			{
				query_para = employeeID;
				query_data = "select " + "" + c1_name + "" + " as FIELD_INIT from employee where employee_id=" + employeeID + "";
			}
			else if (dataRow["FIELD_INIT"].Contains("dynamic"))
			{
				var dyn_tab = table_name.split('__');
				var table_id = dyn_tab[1];
				query_data = "select " + "" + c1_name + "" + " as FIELD_INIT from customer_dynamic where table_id=" + table_id + " and customer_id=" + customerId + "";
			}
			//query_data="select "+"" + column_name +""+ " from " +"" + table_name +""+ " where " +"" +table_name+""+ "_id="+query_para+"";
			var dynfieldReq = RequestFactory.CreateDataRequest("Search", bo.CreateParams.UserToken, "vt_query");
			dynfieldReq.CreateParams["query_sql"] = query_data;
			var dynfieldResp = DataRequest.Execute(dynfieldReq);
			var dynfieldTable = dynfieldResp.Data.Tables['vt_query'];

			if (dynfieldTable.Rows.Count > 0)
			{
				if (dataRow["FIELD_INIT"] == "event_address/vc_display_address")
				{
					dataRow["FIELD_INIT"] = address;
				}
				else
				{
					dataRow["FIELD_INIT"] = dynfieldTable.Rows[0]["FIELD_INIT"];
				}
			}
		}
		table_name = null;
		column_name = null;
	}
	var custDataJson = JsonSerializeTable(custDataTable);

	//var value = '{"customerFields":' + custDataJson + ',"customerName":'+customerJson+',"cust_ADD":'+custaddJson+',"repEmail":'+empemailJson+',"cipcode":'+cipcodeJson+'}';
	var value = '{"customerFields":' + custDataJson + '}';

	// FxM | 2017-12-10 | Escape special characters in result string
	Control.WebView.EvaluateJavascript("performOfflineScriptCallback('regionFieldsData', '" + _escape(value) + "')");
}