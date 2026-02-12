namespace WebApi.Infrastructure.Data;

public class TStateResult
{
    public string Status { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public string ProcedureName { get; set; } = string.Empty;
    public Dictionary<string, string> Data { get; set; } = new();
    public string Message { get; set; } = string.Empty;

    public bool IsSuccess => Status == "OK";
    public bool IsError => Status == "ERR";
}

public class TStateParser
{
    /// <summary>
    /// Parses tState output format: STATUS~ERRORCODE~PROCEDURE_NAME~DATA~MESSAGE
    /// Example: OK~00000~Sec_Users_Authenticate_User~USERID=1|PASSWORDHASH=abc~Login successful
    /// </summary>
    public TStateResult Parse(string tState)
    {
        if (string.IsNullOrWhiteSpace(tState))
        {
            return new TStateResult
            {
                Status = "ERR",
                ErrorCode = "SYS-00-001",
                Message = "tState output is null or empty"
            };
        }

        var parts = tState.Split('~');
        if (parts.Length < 5)
        {
            return new TStateResult
            {
                Status = "ERR",
                ErrorCode = "SYS-00-002",
                Message = $"Invalid tState format: {tState}"
            };
        }

        var result = new TStateResult
        {
            Status = parts[0],
            ErrorCode = parts[1],
            ProcedureName = parts[2],
            Message = parts[4]
        };

        // Parse data section (format: KEY1=VALUE1|KEY2=VALUE2)
        var dataSection = parts[3];
        if (!string.IsNullOrWhiteSpace(dataSection) && dataSection != "N/A")
        {
            var dataPairs = dataSection.Split('|');
            foreach (var pair in dataPairs)
            {
                var keyValue = pair.Split('=', 2);
                if (keyValue.Length == 2)
                {
                    result.Data[keyValue[0]] = keyValue[1];
                }
            }
        }

        return result;
    }
}
