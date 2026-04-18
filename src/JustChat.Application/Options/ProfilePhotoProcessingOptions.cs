namespace JustChat.Application.Options;

public class ProfilePhotoProcessingOptions
{
    public const string SectionKey = "ProfilePhotoProcessing";

    public required int OutputWidth { get; set; }
    public required int OutputHeight { get; set; }
    public required int WebpQuality { get; set; }
}
