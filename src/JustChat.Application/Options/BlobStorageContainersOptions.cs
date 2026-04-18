namespace JustChat.Application.Options;

public class BlobStorageContainersOptions
{
    public const string BlobStorageContainersOptionsKey = "BlobStorageContainers";

    public required string ProfilePhotos { get; set; }
}
