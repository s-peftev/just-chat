BEGIN TRANSACTION;
BEGIN TRY
    -- 1. AspNetUsers
    MERGE INTO [dbo].[AspNetUsers] AS [Target]
    USING (VALUES
        (N'C3000001-0001-0001-0001-000000000001', N'testuser@example.com'),
        (N'C3000001-0001-0001-0001-000000000002', N'testuser2@example.com')
    ) AS [Source]([Id], [Email])
    ON [Target].[Id] = [Source].[Id]
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([Id], [UserName], [NormalizedUserName], [Email], [NormalizedEmail], [EmailConfirmed],
                [PasswordHash], [SecurityStamp], [ConcurrencyStamp], [PhoneNumberConfirmed], [TwoFactorEnabled], [LockoutEnabled], [AccessFailedCount])
        VALUES ([Source].[Id], [Source].[Email], UPPER([Source].[Email]), [Source].[Email], UPPER([Source].[Email]), 1, 
                N'AQAAAAIAAYagAAAAEKQ3llzRuXM043w3IXETGMr/qGeEBScanqRjYZQ1K4XYqz9NWNLY6C7Ky4dlJ2nO5g==', 
                CAST([Source].[Id] AS NVARCHAR(MAX)), NEWID(), 0, 0, 1, 0);

    -- 2. UserProfiles
    MERGE INTO [dbo].[UserProfiles] AS [Target]
    USING (VALUES
        (N'C3000001-0001-0001-0001-000000000001', N'Test', N'User'),
        (N'C3000001-0001-0001-0001-000000000002', N'Test', N'User2')
    ) AS [Source]([Id], [FirstName], [LastName])
    ON [Target].[UserId] = [Source].[Id]
    WHEN MATCHED THEN
        UPDATE SET [FirstName] = [Source].[FirstName], [LastName] = [Source].[LastName], [UpdatedAt] = GETUTCDATE()
    WHEN NOT MATCHED BY TARGET THEN
        INSERT ([UserId], [FirstName], [LastName], [CreatedAt])
        VALUES ([Source].[Id], [Source].[FirstName], [Source].[LastName], GETUTCDATE());

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH