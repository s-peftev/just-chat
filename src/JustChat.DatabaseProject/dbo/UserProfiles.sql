CREATE TABLE [dbo].[UserProfiles]
(
	[UserId]                    NVARCHAR(450)     NOT NULL, 
    [FirstName]                 NVARCHAR(100)     NULL,
    [LastName]                  NVARCHAR(100)     NULL,
    [ProfilePhotoUrl]           NVARCHAR(500)     NULL,
    [CreatedAt]                 DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt]                 DATETIME2         NULL,

    CONSTRAINT [PK_UserProfiles] PRIMARY KEY CLUSTERED ([UserId] ASC),
    CONSTRAINT [FK_UserProfiles_AspNetUsers_UserId]
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE
)