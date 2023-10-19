using Backend.Business;
using Backend.Infrastructure.EntityFramework.Datatables;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.EntityFramework
{
    public class CoreFrameworkContext : DbContext
    {
        public DbSet<SysHistory>? Histories { get; set; }
        public DbSet<SysDeletedItem>? DeletedItems { get; set; }
        public DbSet<SysNavigation>? Navigations { get; set; }
        public DbSet<SysPolicy>? Policies { get; set; }
        public DbSet<SysUser>? Users { get; set; }
        public DbSet<SysRole>? Roles { get; set; }
        public DbSet<SysUserMetadata>? UserMetadata { get; set; }

        public DbSet<SysEmailHistory>? EmailHistories { get; set; }



        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var connectionString = Backend.Infrastructure.Utils.Utils.GetConfig("ConnectionStrings:Core.Framework");
            optionsBuilder.UseSqlServer(connectionString);
            //optionsBuilder.LogTo(Console.WriteLine);
        }
    }
}
