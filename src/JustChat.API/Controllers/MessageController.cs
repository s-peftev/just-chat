using JustChat.API.Extensions;
using JustChat.Application.Interfaces.Entities;
using JustChat.Contracts.Requests.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JustChat.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MessageController(IMessageService messageService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetMessages([FromQuery] ChatMessagesRequest request, CancellationToken ct)
    {
        var result = await messageService.GetMessagesForChatAsync(request, ct);

        return result.Match(
            data => Ok(data),
            error => error.CreateErrorResponse());
    }
}
