CREATE TABLE [dbo].[Messages] (
    [Id]           UNIQUEIDENTIFIER  NOT NULL DEFAULT NEWID(),
    [Text]         NVARCHAR(MAX)     NOT NULL,
    [CreatedAt]    DATETIME2         NOT NULL DEFAULT GETUTCDATE(),
    [Sentiment]    INT               NOT NULL,
    [UserId]       NVARCHAR(450)     NOT NULL,

    CONSTRAINT [PK_Messages] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_Messages_UserProfiles_UserProfileId]
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[UserProfiles]([UserId]) ON DELETE CASCADE
);
