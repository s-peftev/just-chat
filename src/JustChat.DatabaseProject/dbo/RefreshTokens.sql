CREATE TABLE [dbo].[RefreshTokens]
(
	[Id]             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [SessionId]      UNIQUEIDENTIFIER NOT NULL,
    [Token]          NVARCHAR(450)    NOT NULL,
    [ExpiresAtUtc]   DATETIME2        NOT NULL,
    [IsRevoked]      BIT              NOT NULL DEFAULT 0,
    [RevokedAtUtc]   DATETIME2        NULL,
    [CreatedAtUtc]   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    [UserAgent]      NVARCHAR(500)    NULL,
    [IpAddress]      NVARCHAR(100)    NULL,
    [UserId]         NVARCHAR(450)    NOT NULL,

    CONSTRAINT [PK_RefreshTokens] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId]
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[AspNetUsers]([Id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_RefreshTokens_Token] UNIQUE ([Token])
);
GO

CREATE INDEX [IX_RefreshTokens_UserId] ON [dbo].[RefreshTokens] ([UserId]);
