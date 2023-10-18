using System.ComponentModel.DataAnnotations;

namespace Backend.Business
{
    public class ServiceAlongExamModel
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public long Price { get; set; }
        public int Order { get; set; }
        public string? Note { get; set; }
        public bool IsShow { get; set; } = false;
    }
}
