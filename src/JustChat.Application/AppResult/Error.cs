using JustChat.Contracts.Enums;

namespace JustChat.Application.AppResult;

/// <summary>
/// Structured error passed through the Result pattern.
/// </summary>
/// <param name="Id">Machine-readable error code (e.g. "NotFound", "Forbidden").</param>
/// <param name="Type">Error category used to map to an HTTP status code.</param>
/// <param name="Details">Optional list of field-level validation messages.</param>
public record Error(
    string Id,
    ErrorType Type,
    IEnumerable<string>? Details = null
);
